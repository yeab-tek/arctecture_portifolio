"""
Email notifications via Resend. Sending failure should never break an
inquiry submission itself - REQ-CON-04 is a [Could], not a [Must].
"""
import logging
import resend
from app.config import settings

logger = logging.getLogger(__name__)


def send_inquiry_notification(inquiry) -> None:
    print(f"[email] send_inquiry_notification called for inquiry {inquiry.id}")
    print(f"[email] api_key set: {bool(settings.resend_api_key)}")

    if not settings.resend_api_key:
        print("[email] SKIPPING - no API key configured")
        return

    resend.api_key = settings.resend_api_key

    try:
        result = resend.Emails.send({
            "from": settings.resend_from_email,
            "to": settings.admin_email,
            "subject": f"New inquiry from {inquiry.name}",
            "html": (
                f"<p><strong>Name:</strong> {inquiry.name}</p>"
                f"<p><strong>Email:</strong> {inquiry.email}</p>"
                f"<p><strong>Message:</strong></p>"
                f"<p>{inquiry.message}</p>"
            ),
        })
        print(f"[email] SUCCESS - Resend response: {result}")
    except Exception as e:
        print(f"[email] FAILED - {type(e).__name__}: {e}")
        logger.exception("Failed to send inquiry notification email")
