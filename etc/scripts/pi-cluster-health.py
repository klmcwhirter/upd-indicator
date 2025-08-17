#!/usr/bin/env -S python

'''
pi-cluster-health.py
'''

import os
import subprocess
import sys


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

    for host in hosts:
        full_cmd = f'ssh {host} {cmd}'

        if verbose:
            print(f'Executing: {full_cmd}', flush=True)

        proc = subprocess.run(
            full_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=True,
            encoding='utf-8',
            text=True,
        )

        if proc.returncode != 0:
            if verbose:
                print(f'cmd exited with {proc.returncode=}', flush=True)
            lines.append(f'{{ "{host}": "{msg}" }}, ')

        if verbose:
            print(proc.stdout, flush=True)

    if not verbose and len(lines) > 0:
        rc = f'[{"\n".join(lines)}]'

    return rc


def main(*, verbose=False) -> None:
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
        print(e, file=os.stderr, flush=True)
        sys.exit(2)
