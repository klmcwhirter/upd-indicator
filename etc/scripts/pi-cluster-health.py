#!/usr/bin/env -S python

'''
pi-cluster-health.py
'''

import concurrent.futures
import multiprocessing as mp
import subprocess
import sys
import time
from dataclasses import dataclass
from functools import wraps

NUM_TRIES = 5


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


def prefixed_lines(prefix: str, lines: list[str]) -> str:
    return f'\n----------\n{prefix}\n----------\n{''.join(lines)}'


class ProcessNonZeroRetcodeError(Exception):
    def __init__(self, cmd: str, returncode: int) -> None:
        super().__init__()
        self.cmd = cmd
        self.returncode = returncode

    def __repr__(self) -> str:
        return f'ProcessNonZeroRetcodeError(cmd={self.cmd}, returncode={self.returncode})'


def retry(ExceptionToCheck, tries=NUM_TRIES, delay=3, backoff=2):
    '''Retry calling the decorated function using an exponential backoff.

    http://www.saltycrane.com/blog/2009/11/trying-out-retry-decorator-python/
    original from: http://wiki.python.org/moin/PythonDecoratorLibrary#Retry

    :param ExceptionToCheck: the exception to check. may be a tuple of exceptions to check
    :type ExceptionToCheck: Exception or tuple
    :param tries: number of times to try (not retry) before giving up
    :type tries: int
    :param delay: initial delay between retries in seconds
    :type delay: int
    :param backoff: backoff multiplier e.g. value of 2 will double the delay each retry
    :type backoff: int
    :param logger: logger to use. If None, print
    :type logger: logging.Logger instance
    '''
    def deco_retry(f):

        @wraps(f)
        def f_retry(*args, **kwargs):
            mtries, mdelay = tries, delay
            while mtries > 1:
                try:
                    return f(*args, **kwargs)
                except ExceptionToCheck:
                    print(f'{ExceptionToCheck}, Retrying in {mdelay} seconds...', file=sys.stderr, flush=True)
                    time.sleep(mdelay)
                    mtries -= 1
                    mdelay *= backoff
            return f(*args, **kwargs)

        return f_retry  # true decorator

    return deco_retry


@retry(ProcessNonZeroRetcodeError)
def run_with_retry(cmd: str, verbose=False) -> subprocess.CompletedProcess[str]:
    if verbose:
        print(cmd, file=sys.stderr, flush=True)

    proc = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=True,
        encoding='utf-8',
        text=True,
    )

    if proc.returncode > 1:  # check was not successful
        raise ProcessNonZeroRetcodeError(cmd=cmd, returncode=proc.returncode)

    return proc


def process_host(ctx: WorkerContext) -> tuple[list[str], list[str]]:
    out: list[str] = []
    err: list[str] = []

    if ctx.verbose:
        err.append(f'{ctx.name}: Executing: {ctx.cmd}\n')

    proc = run_with_retry(ctx.cmd, verbose=ctx.verbose)

    if proc.returncode != 0:
        if ctx.verbose:
            err.append(f'{ctx.name}: cmd exited with {proc.returncode=}\n')

        out.append(f'{{ "name": "{ctx.host}", "status": "{ctx.msg}" }}')

    if ctx.verbose:
        err.extend(proc.stdout.splitlines(keepends=True))

    return (out, err)


def pi_cluster_health(*, hosts: list[str], cmd: str, msg: str, verbose=False) -> tuple[str, str]:
    '''
    Executes a command on a list of hosts via SSH and reports their health.

    :param hosts: A list of hostnames or IP addresses.
    :param cmd: The command to execute on each host.
    :param msg: Message to include in json output.
    :param verbose: If True, prints the command before execution and displays the captured output.
        Defaults to False.
    :return: int - subprocess.CompletedProcess.returncode
    '''

    cmd_addon = ' -v' if verbose else ''

    _worker_contexts = [
        WorkerContext(idx=idx, host=host, cmd=f'ssh {host} {cmd}{cmd_addon}', msg=msg, verbose=verbose)
        for idx, host in enumerate(hosts)
    ]

    out: list[str] = []
    err: list[str] = []

    with concurrent.futures.ProcessPoolExecutor() as executor:
        futures = {
            executor.submit(process_host, ctx=worker_ctx): worker_ctx
            for worker_ctx in _worker_contexts
        }

        for future in concurrent.futures.as_completed(futures):
            worker_ctx = futures[future]
            sub_out, sub_err = future.result()

            if sub_out and len(sub_out) > 0:
                out.extend(sub_out)
            err.append(prefixed_lines(worker_ctx.host, sub_err))

    rc = f'[{",".join(out)}]' if not verbose and len(out) > 0 else ''

    err_rc = ''.join(err)

    return (rc, err_rc)


def main(*, verbose=False) -> None:
    mp.set_start_method('spawn')

    hosts = ['pi1.lan', 'pi2.lan', 'pi3.lan']

    out, err = pi_cluster_health(hosts=hosts, cmd='sudo /home/klmcw/.local/bin/check-4-upds.sh', msg='Needs Attention', verbose=verbose)
    if not verbose:
        # steps.py#process creates a file if len(proc.stdout) > 0 - so prevent even \n output if nothing to report
        if len(out) > 0:
            print(out, flush=True)

    if verbose:
        print(err, file=sys.stderr, flush=True)

        _, err = pi_cluster_health(hosts=hosts, cmd='ls -l /var/log/apt/term.log', msg='Log long listing', verbose=verbose)
        print(err, file=sys.stderr, flush=True)


if __name__ == '__main__':
    verbose = '-v' in sys.argv[1:]

    rc = 0
    try:
        rc = main(verbose=verbose)
    except Exception as e:
        print(e, file=sys.stderr, flush=True)
        sys.exit(2)
