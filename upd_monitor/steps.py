import glob
import json
import logging
import os
from contextlib import contextmanager
from pathlib import Path
from pprint import pprint
from typing import Generator

from upd_monitor.models import AppContext
from upd_monitor.utils import log_entry_exit, run_with_output


@contextmanager
def changed_dir(path: str) -> Generator[None]:
    origin = Path().absolute()
    logging.info(f'{origin=} ==> {path=}')

    try:
        os.chdir(path)

        yield
    finally:
        os.chdir(origin)


@log_entry_exit
def clean_files(ctx: AppContext) -> int:
    '''remove all files in the updates dir'''
    rc = 0
    try:
        for f in glob.iglob(f'{ctx.monitor_location}/*'):
            os.unlink(f)
    except Exception as err:
        logging.error(err)
        rc = 255
    return rc


@log_entry_exit
def import_settings_file(ctx: AppContext) -> int:
    rc = 0
    try:
        settings = None
        with open(ctx.import_settings_file, 'r') as jf:
            settings = json.load(jf)

            ctx.settings = settings
    except Exception as err:
        logging.error(err)
        rc = 255
    return rc


@log_entry_exit
def list_files(ctx: AppContext) -> int:
    '''Given the config file in force, list the images to create'''
    logging.debug(f'monitor_location={ctx.monitor_location}')

    for f in glob.iglob(f'{ctx.monitor_location}/*.json'):
        print(f'{f}')

    return 0


@log_entry_exit
def list_all_rules(ctx: AppContext) -> int:
    pprint(ctx.rules, width=90, compact=False, sort_dicts=False)
    return 0


@log_entry_exit
def list_rules_enabled(ctx: AppContext) -> int:
    pprint(ctx.rules_enabled, width=90, compact=False, sort_dicts=False)
    return 0


@log_entry_exit
def list_settings(ctx: AppContext) -> int:
    pprint(ctx.settings, width=90, compact=False, sort_dicts=False)
    return 0


@log_entry_exit
def process(ctx: AppContext) -> int:
    rc = 0
    if not ctx.skip_clean:
        rc = clean_files(ctx=ctx)
    else:
        logging.warning(f'Skipping clean step - clean={ctx.skip_clean}')

    for rule in ctx.rules_enabled:
        logging.info(f'Processing {rule.file_name} ...')

        proc = run_with_output(rule.command)

        if proc.stderr:
            logging.warning(proc.stderr)

        if proc.returncode != rule.notErrorCode:
            logging.error(f'rule "{rule.name}" exited with error code {proc.returncode}')
        elif proc.stdout and len(proc.stdout) > 0:
            file_name = f'{ctx.monitor_location}/{rule.file_name}.json'
            with open(file_name, 'w') as f:
                f.write(proc.stdout)

        logging.info(f'Processing {rule.file_name} ... done')

    return rc


def run_steps(ctx: AppContext) -> int:
    rc = 0

    if not os.path.exists(ctx.monitor_location):
        os.makedirs(ctx.monitor_location, exist_ok=True)

    if ctx.verb == 'clean':
        rc = clean_files(ctx=ctx)
    elif ctx.verb == 'import':
        rc = import_settings_file(ctx=ctx)
    elif ctx.verb == 'list':
        if ctx.list_enabled:
            rc = list_rules_enabled(ctx=ctx)
        elif ctx.list_all:
            rc = list_all_rules(ctx=ctx)
        elif ctx.list_files:
            rc = list_files(ctx=ctx)
        elif ctx.list_settings:
            rc = list_settings(ctx=ctx)
    elif ctx.verb == 'process':
        rc = process(ctx=ctx)
    else:
        print(f"verb '{ctx.verb}' is not supported")
        rc = 2

    return rc
