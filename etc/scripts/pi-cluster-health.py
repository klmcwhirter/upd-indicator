#!/usr/bin/env -S python

'''
pi-cluster-health.py
'''

import concurrent.futures
import multiprocessing as mp
import subprocess
import sys
from dataclasses import dataclass


@dataclass
class WorkerContext:
    idx: int
    host: str
    cmd: str
    msg: str
    verbose: bool

    @property
    def name(self) -> str:
        rc = f'Worker-{self.idx:02}'
        return rc


def process_host(ctx: WorkerContext) -> str:
    if ctx.verbose:
        print(f'{ctx.name}: Executing: {ctx.cmd}', flush=True)

    result = ''

    proc = subprocess.run(
        ctx.cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=True,
        encoding='utf-8',
        text=True,
    )

    if proc.returncode != 0:
        if ctx.verbose:
            print(f'{ctx.name}: cmd exited with {proc.returncode=}', flush=True)
        result = f'{{ "name": "{ctx.host}", "status": "{ctx.msg}" }}'

    if ctx.verbose:
        print(proc.stdout, flush=True)

    return result


def pi_cluster_health(*, hosts: list[str], cmd: str, msg: str, verbose=False) -> str:
    '''
    Executes a command on a list of hosts via SSH and reports their health.

    :param hosts: A list of hostnames or IP addresses.
    :param cmd: The command to execute on each host.
    :param msg: Message to include in json output.
    :param verbose: If True, prints the command before execution and displays the captured output.
        Defaults to False.
    :return: int - subprocess.CompletedProcess.returncode
    '''

    rc = ''
    lines: list[str] = []

    _worker_contexts = [
        WorkerContext(idx=idx, host=host, cmd=f'ssh {host} {cmd}', msg=msg, verbose=verbose)
        for idx, host in enumerate(hosts)
    ]

    with concurrent.futures.ProcessPoolExecutor() as executor:
        futures = {
            executor.submit(process_host, ctx=worker_ctx): worker_ctx
            for worker_ctx in _worker_contexts
        }

        for future in concurrent.futures.as_completed(futures):
            # worker_ctx = futures[future]
            result = future.result()

            if result and len(result) > 0:
                lines.append(result)

    if not verbose and len(lines) > 0:
        rc = f'[{",".join(lines)}]'

    return rc


def main(*, verbose=False) -> None:
    mp.set_start_method('spawn')

    hosts = ['pi2.lan', 'pi3.lan']

    out = pi_cluster_health(hosts=hosts, cmd='sudo /home/klmcw/.local/bin/check-4-upds.sh', msg='Needs Attention', verbose=verbose)
    if not verbose:
        # steps.py#process creates a file if len(proc.stdout) > 0 - so prevent even \n output if nothing to report
        if len(out) > 0:
            print(out, flush=True)

    if verbose:
        _ = pi_cluster_health(hosts=hosts, cmd='ls -l /var/log/apt/term.log', msg='Log long listing', verbose=verbose)


if __name__ == '__main__':
    verbose = '-v' in sys.argv[1:]

    rc = 0
    try:
        rc = main(verbose=verbose)
    except Exception as e:
        print(e, file=sys.stderr, flush=True)
        sys.exit(2)
