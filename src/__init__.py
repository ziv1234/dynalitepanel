"""Dynalite Frontend"""
from .constants import FILE_HASH, DEV


def locate_dir():
    """Return the location of the frontend files."""
    return __path__[0]


def get_build_id():
    """Get the Dynalite panel build id."""
    if DEV:
        return "dev"
    return FILE_HASH
