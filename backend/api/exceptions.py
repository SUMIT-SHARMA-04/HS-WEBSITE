from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """Normalizes every DRF-handled error response to {"error": ...}.

    Without this, error shapes vary by what raised them: manually-raised
    errors in views.py already return {"error": "message"}, but DRF's
    defaults return {"detail": "..."} for things like permission/auth
    failures and 404s, and {"field": ["msg"]} for serializer validation
    errors. A frontend has to special-case each shape to show an error
    message. This collapses all of them into one consistent envelope.
    """
    response = exception_handler(exc, context)
    if response is None:
        return None

    if isinstance(response.data, dict):
        if 'error' in response.data:
            # Already in the app's own shape (raised manually in a view).
            return response
        if 'detail' in response.data and len(response.data) == 1:
            # DRF's default shape for auth/permission/throttle/404 errors.
            response.data = {"error": response.data['detail']}
            return response

    # Anything else — typically a serializer's {"field": ["msg", ...]} or
    # {"non_field_errors": [...]} validation errors — nest as-is so no
    # field-level detail is lost, just wrapped consistently.
    response.data = {"error": response.data}
    return response
