'''upd_monitor monitor reference implementation'''

import sys

from upd_monitor.cli import parse_args
from upd_monitor.steps import run_steps


def main(args: list[str]) -> int:
    ctx = parse_args(args=args)

    ctx.log()

    rc = run_steps(ctx=ctx)

    return rc


if __name__ == '__main__':
    rc = main(sys.argv[1:])
    sys.exit(rc)
