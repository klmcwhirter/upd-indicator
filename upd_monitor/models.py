
import argparse
import logging
import sys
from dataclasses import dataclass
from pprint import pformat

from upd_monitor.settings import from_settings
from upd_monitor.utils import cmd_with_output


@dataclass
class MonitorRule:
    name: str
    description: str
    enabled: bool
    command: str
    notErrorCode: int

    @property
    def file_name(self) -> str:
        return self.name.replace(' ', '-')


@dataclass
class AppContext:
    '''The app operating context'''
    args: argparse.Namespace

    def __post_init__(self) -> None:
        self._setup_logging()
        self.settings = from_settings()

    @property
    def list_enabled(self) -> bool:
        return self.args.enabled

    @property
    def list_files(self) -> bool:
        return self.args.files

    @property
    def list_settings(self) -> bool:
        return self.args.settings

    @property
    def monitor_location(self) -> str:
        # return cmd_with_output(f'/bin/bash -c set')
        return cmd_with_output(f'/bin/bash -c "echo {self.settings['monitor']['location']}"', verbose=False).rstrip()

    @property
    def skip_clean(self) -> bool:
        return self.args.skip_clean

    @property
    def verb(self) -> str:
        return self.args.verb

    @property
    def verbose(self) -> bool:
        return self.args.verbose

    @property
    def rules(self) -> list[MonitorRule]:
        if not hasattr(self, '_rules'):
            self._rules = list(map(
                lambda r: MonitorRule(
                    r['name'],
                    r['description'],
                    r['enabled'],
                    r['command'],
                    r['notErrorCode'],
                ),
                self.settings['rules']))
        return self._rules

    @property
    def rules_enabled(self) -> list[MonitorRule]:
        return list(r for r in self.rules if r.enabled)

    def _setup_logging(self) -> None:
        log_level = logging.DEBUG if self.verbose else logging.INFO
        logging.basicConfig(level=log_level, stream=sys.stdout,
                            format='{asctime} - {module} - {levelname} - {funcName} - {message}', style='{')

    def log(self) -> None:
        logging.debug(pformat(self, indent=0, depth=3,
                      width=196, compact=True, sort_dicts=False))

    @staticmethod
    def from_args(args: argparse.Namespace) -> AppContext:  # noqa F821
        return AppContext(args=args)
