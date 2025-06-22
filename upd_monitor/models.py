
import argparse
import json
import logging
import sys
from dataclasses import dataclass
from pprint import pformat

from upd_monitor.settings import from_settings, import_settings


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

    @property
    def import_settings_file(self) -> str:
        return self.args.jsonfile

    @property
    def list_all(self) -> bool:
        return self.args.all

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
        return self.settings['monitor']['location']

    @property
    def rule_args(self) -> list[str]:
        return self.args.args

    @property
    def rule(self) -> str:
        return self.args.rule

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
            rules = []
            with open(self.settings['rules-path'], 'r') as rf:
                rules = json.load(rf)

            self._rules = list(map(
                lambda r: MonitorRule(
                    r['name'],
                    r['description'],
                    r['enabled'],
                    r['command'],
                    r['notErrorCode'],
                ),
                rules))
        return self._rules

    @property
    def settings(self) -> dict:
        if not hasattr(self, '_settings'):
            self._settings = from_settings()
        return self._settings

    @settings.setter
    def settings(self, settings: dict):
        import_settings(settings=settings)

    @property
    def rules_enabled(self) -> list[MonitorRule]:
        return list(r for r in self.rules if r.enabled)

    def _setup_logging(self) -> None:
        log_level = logging.DEBUG if self.verbose else logging.INFO
        logging.basicConfig(level=log_level, stream=sys.stderr,
                            format='{asctime} - {module} - {levelname} - {funcName} - {message}', style='{')

    def log(self) -> None:
        logging.debug(pformat(self, indent=0, depth=3,
                      width=196, compact=True, sort_dicts=False))

    @staticmethod
    def from_args(args: argparse.Namespace) -> AppContext:  # noqa F821
        return AppContext(args=args)
