'''The upd_monitor command line interface'''

import argparse

from upd_monitor.models import AppContext


def parse_args(args: list[str]) -> AppContext:
    parser = argparse.ArgumentParser()

    verbs = parser.add_subparsers(title='verbs', required=True, dest='verb', metavar='(list | process | exec | clean | import)')

    ls_desc = 'List information about the configuration or the system'
    ls = verbs.add_parser('list',
                          description=ls_desc,
                          help=ls_desc,
                          formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    meg = ls.add_mutually_exclusive_group(required=True)
    meg.add_argument('-a', '--all', default=False, action='store_true', help='list all rules')
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

    exec_desc = 'Execute an update rule'
    exec = verbs.add_parser('exec',
                            description=exec_desc,
                            help=exec_desc,
                            formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    exec.add_argument('rule',
                      help='the rule to execute')
    exec.add_argument('args', nargs='*',
                      help='Additional args to pass to rule command')

    exec.add_argument('-v', '--verbose', default=False, action='store_true', help='enable verbose output')

    clean_desc = 'Clean up json files'
    clean = verbs.add_parser('clean',
                             description=clean_desc,
                             help=clean_desc,
                             formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    clean.add_argument('-v', '--verbose', default=False, action='store_true', help='enable verbose output')

    import_desc = 'import settings via a json file'
    import_cmd = verbs.add_parser('import',
                                  description=import_desc,
                                  help=import_desc,
                                  formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    import_cmd.add_argument('-j', '--jsonfile', default='settings.json', help='path to settings.json file')
    import_cmd.add_argument('-v', '--verbose', default=False, action='store_true', help='enable verbose output')

    pargs = parser.parse_args(args=args)

    return AppContext.from_args(args=pargs)
