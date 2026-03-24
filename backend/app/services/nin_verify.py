import httpx
from app.core.config import settings

# NIN Verification via Smile ID / VerifyMe / Prembly
# This is a template — replace with your chosen provider's API


async def verify_nin(nin: str) -> dict:
    """
    Verify NIN and return identity details.
    In production, use Smile ID, VerifyMe, or Prembly API.

    Returns:
        {
            "verified": bool,
            "full_name": str,
            "first_name": str,
            "last_name": str,
            "photo_url": str,  # Photo from NIMC database
            "address": str,
            "state": str,
            "gender": str,
            "dob": str,
        }
    """
    # TODO: Replace with real API call
    # Example with VerifyMe:
    # async with httpx.AsyncClient() as client:
    #     resp = await client.post(
    #         "https://vapi.verifyme.ng/v1/verifications/identities/nin",
    #         json={"firstname": "", "lastname": "", "nin": nin},
    #         headers={"Authorization": f"Bearer {settings.VERIFYME_API_KEY}"},
    #     )
    #     data = resp.json()
    #     return {
    #         "verified": True,
    #         "full_name": f"{data['data']['firstname']} {data['data']['lastname']}",
    #         ...
    #     }

    # Mock response for development
    return {
        "verified": True,
        "full_name": "Test User",
        "first_name": "Test",
        "last_name": "User",
        "photo_url": None,
        "address": "Lagos, Nigeria",
        "state": "Lagos",
        "gender": "Male",
        "dob": "1990-01-01",
    }


def name_match_score(name1: str, name2: str) -> float:
    """
    Calculate how closely two names match.
    Returns a score between 0.0 and 1.0.
    """
    if not name1 or not name2:
        return 0.0

    n1 = set(name1.lower().split())
    n2 = set(name2.lower().split())

    if not n1 or not n2:
        return 0.0

    intersection = n1 & n2
    union = n1 | n2

    return len(intersection) / len(union)
