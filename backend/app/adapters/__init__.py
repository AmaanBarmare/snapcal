"""External-service adapters.

Every adapter file in here exposes a `get_*` factory that returns either
the Mock implementation (USE_MOCKS=true) or the real one. The two share
an identical interface (Protocol), so swapping is a one-place change.
"""
