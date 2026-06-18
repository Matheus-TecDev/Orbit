import re


PASSWORD_RULE_MESSAGE = (
    "A senha deve ter entre 8 e 26 caracteres, com letra maiúscula, "
    "letra minúscula, número e caractere especial."
)


def validate_strong_password(value: str) -> str:
    if len(value) < 8 or len(value) > 26:
        raise ValueError(PASSWORD_RULE_MESSAGE)

    checks = [
        re.search(r"[A-Z]", value),
        re.search(r"[a-z]", value),
        re.search(r"\d", value),
        re.search(r"[^A-Za-z0-9]", value),
    ]

    if not all(checks):
        raise ValueError(PASSWORD_RULE_MESSAGE)

    return value
