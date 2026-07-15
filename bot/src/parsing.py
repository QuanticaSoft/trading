class ArgParseError(ValueError):
    pass


def parse_kv_args(args: str | None) -> dict[str, str]:
    """Parse 'KEY=VALUE KEY2=VALUE2' command args into a dict.

    Keys are case-insensitive and normalized to lowercase. Values are left
    as raw strings; field-level validation happens in schemas.py.
    """
    if not args:
        return {}

    result: dict[str, str] = {}
    for token in args.split():
        if "=" not in token:
            raise ArgParseError(f"Argumento sin formato KEY=VALUE: {token!r}")
        key, _, value = token.partition("=")
        key = key.strip().lower()
        value = value.strip()
        if not key or not value:
            raise ArgParseError(f"Argumento inválido: {token!r}")
        result[key] = value
    return result
