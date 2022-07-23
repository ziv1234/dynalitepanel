"""Dynalite Frontend"""
from .version import VERSION

def locate_dir():
    return __path__[0]

def get_build_id(is_dev):
    """Get the Dynalite panel build id."""
    if is_dev:
        return "dev"
    return "abcdef12"
