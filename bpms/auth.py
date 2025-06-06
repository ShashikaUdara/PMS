from fastapi import Request, HTTPException, status

def validate_token(request: Request, token: str, header_name: str = "authorization"):
    """
    Validates the given token against the token in the request headers.

    Args:
        request (Request): The FastAPI request object.
        token (str): The token to validate against.
        header_name (str): The header name where the token is expected.

    Raises:
        HTTPException: If the token is missing or does not match.
    """
    request_token = request.headers.get(header_name)
    if request_token and request_token.startswith("Bearer "):
        request_token = request_token[len("Bearer "):]

    print(request_token)

    if not request_token or request_token != token:
        return False
    
    return True