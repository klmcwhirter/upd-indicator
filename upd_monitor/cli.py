'''The upd_monitor command line interface'''

import argparse

from upd_monitor.models import AppContext


def parse_args(args: list[str]) -> AppContext:
    parser = argparse.ArgumentParser()

    verbs = parser.add_subparsers(title='verbs', required=True, dest='verb', metavar='(list | process | clean)')

    ls_desc = 'List information about the configuration or the system'
    ls = verbs.add_parser('list',
                          description=ls_desc,
                          help=ls_desc,
                          formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    meg = ls.add_mutually_exclusive_group(required=True)
    meg.add_argument('-e', '--enabled', default=False, action='store_true', help='list enabled rules')
    meg.add_argument('-f', '--files', default=False, action='store_true', help='list json files')
    meg.add_argument('-s', '--settings', default=False, action='store_true', help='list gsettings')

    ls.add_argument('-v', '--verbose', default=False, action='store_true', help='enable verbose output')

    proc_desc = 'Create json files for each update rule'
    proc = verbs.add_parser('process',
                            description=proc_desc,
                            help=proc_desc,
                            formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    proc.add_argument('-c', '--skip-clean', default=False, action='store_true',
                      help='Skip the removal of json updates file before starting')
    
    proc.add_argument('-v', '--verbose', default=False, action='store_true', help='enable verbose output')

    clean_desc = 'Clean up json files'
    clean = verbs.add_parser('clean',
                             description=clean_desc,
                             help=clean_desc,
                             formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    clean.add_argument('-v', '--verbose', default=False, action='store_true', help='enable verbose output')

    pargs = parser.parse_args(args=args)

    return AppContext.from_args(args=pargs)
