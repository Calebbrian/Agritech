import httpx
from app.core.config import settings

PAYSTACK_BASE = "https://api.paystack.co"
HEADERS = {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}", "Content-Type": "application/json"}


async def verify_bank_account(account_number: str, bank_code: str) -> dict:
    """Verify bank account and return account name"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{PAYSTACK_BASE}/bank/resolve",
            params={"account_number": account_number, "bank_code": bank_code},
            headers=HEADERS,
        )
        data = resp.json()
        if data.get("status"):
            return {
                "account_name": data["data"]["account_name"],
                "account_number": data["data"]["account_number"],
                "bank_id": data["data"].get("bank_id"),
            }
        raise Exception(data.get("message", "Account verification failed"))


async def get_banks() -> list:
    """Get list of Nigerian banks"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{PAYSTACK_BASE}/bank", params={"country": "nigeria"}, headers=HEADERS)
        data = resp.json()
        if data.get("status"):
            return [{"name": b["name"], "code": b["code"]} for b in data["data"]]
        return []


async def initialize_payment(email: str, amount: int, reference: str, callback_url: str = "") -> dict:
    """Initialize a Paystack payment (amount in kobo)"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYSTACK_BASE}/transaction/initialize",
            json={"email": email, "amount": amount, "reference": reference, "callback_url": callback_url},
            headers=HEADERS,
        )
        data = resp.json()
        if data.get("status"):
            return {"authorization_url": data["data"]["authorization_url"], "reference": data["data"]["reference"]}
        raise Exception(data.get("message", "Payment initialization failed"))


async def verify_payment(reference: str) -> dict:
    """Verify a Paystack payment"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{PAYSTACK_BASE}/transaction/verify/{reference}", headers=HEADERS)
        data = resp.json()
        if data.get("status"):
            return {
                "status": data["data"]["status"],
                "amount": data["data"]["amount"] / 100,
                "reference": data["data"]["reference"],
            }
        raise Exception(data.get("message", "Payment verification failed"))


async def create_transfer_recipient(name: str, account_number: str, bank_code: str) -> str:
    """Create a transfer recipient for payouts"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYSTACK_BASE}/transferrecipient",
            json={"type": "nuban", "name": name, "account_number": account_number, "bank_code": bank_code, "currency": "NGN"},
            headers=HEADERS,
        )
        data = resp.json()
        if data.get("status"):
            return data["data"]["recipient_code"]
        raise Exception(data.get("message", "Failed to create recipient"))


async def initiate_transfer(amount: int, recipient_code: str, reason: str, reference: str) -> dict:
    """Initiate a bank transfer (amount in kobo)"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYSTACK_BASE}/transfer",
            json={"source": "balance", "amount": amount, "recipient": recipient_code, "reason": reason, "reference": reference},
            headers=HEADERS,
        )
        data = resp.json()
        if data.get("status"):
            return {"transfer_code": data["data"]["transfer_code"], "status": data["data"]["status"]}
        raise Exception(data.get("message", "Transfer failed"))
