#!/usr/bin/env -S python

import json
import subprocess

HOSTS = [
    'pi2.lan',
    'pi3.lan',
]

unhealth_msgs = []


def add_unhealthy_msg(key: str, msg: str) -> None:
    hmsg = json.dumps({"name": key, "status": msg})
    unhealth_msgs.append(hmsg)


def run_with_output(cmd: str, verbose=False) -> subprocess.CompletedProcess[str]:
    if verbose:
        print(cmd)

    return subprocess.run(cmd, capture_output=True, shell=True, text=True)


for host in HOSTS:
    # Check host / ssh health
    cmd = f'ssh {host} true'
    proc = run_with_output(cmd=cmd)
    healthy = proc.returncode == 0

    # print(f'{proc.returncode=}, {healthy=} "{proc.stdout=}"')

    if not healthy:
        add_unhealthy_msg(host, msg='ssh needs attention')
        continue

    # Check dns health
    cmd = f'ssh {host} docker exec dns6-pihole-1 tail -1 /var/log/pihole-updatelists-cron.log'
    proc = run_with_output(cmd=cmd)
    healthy = 'successful' in proc.stdout

    # print(f'{proc.returncode=}, {healthy=} "{proc.stdout=}"')

    if not healthy:
        add_unhealthy_msg(host, msg='dns needs attention')
        continue

if len(unhealth_msgs) > 0:
    print(unhealth_msgs)
