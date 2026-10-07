from datetime import datetime
import base64
import binascii
import re
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator

RoleType = Literal["SUPER_ADMIN", "MANAGER", "EMPLOYEE"]

class EmployeeBase(BaseModel):
    fName: str = Field(..., max_length=100)
    lName: str = Field(..., max_length=100)
    Login_userid: str = Field(..., max_length=100)
    roles: RoleType
    is_active: bool = True

class EmployeeCreate(EmployeeBase):
    password: str = Field(..., min_length=6)

class EmployeeUpdate(BaseModel):
    fName: Optional[str] = Field(None, max_length=100)
    lName: Optional[str] = Field(None, max_length=100)
    Login_userid: Optional[str] = Field(None, max_length=100)
    password: Optional[str] = Field(None, min_length=6)
    roles: Optional[RoleType] = None
    is_active: Optional[bool] = None
    profile_picture: Optional[str] = None

    @field_validator("profile_picture")
    @classmethod
    def validate_profile_picture(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None
        if len(value) > 2_800_000:
            raise ValueError("Profile picture must be smaller than 2 MB.")
        match = re.fullmatch(r"data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)", value)
        if not match:
            raise ValueError("Profile picture must be a PNG, JPEG, or WebP image.")
        try:
            image_bytes = base64.b64decode(match.group(2), validate=True)
        except (binascii.Error, ValueError) as exc:
            raise ValueError("Profile picture data is invalid.") from exc
        if not image_bytes or len(image_bytes) > 2 * 1024 * 1024:
            raise ValueError("Profile picture must be smaller than 2 MB.")

        image_type = match.group(1)
        valid_signature = (
            image_type == "png" and image_bytes.startswith(b"\x89PNG\r\n\x1a\n")
        ) or (
            image_type == "jpeg" and image_bytes.startswith(b"\xff\xd8\xff")
        ) or (
            image_type == "webp"
            and image_bytes.startswith(b"RIFF")
            and image_bytes[8:12] == b"WEBP"
        )
        if not valid_signature:
            raise ValueError("Image content does not match its declared file type.")
        return value

class EmployeeResponse(EmployeeBase):
    emp_id: int
    created_on: datetime
    updated_on: datetime
    last_logged_in: Optional[datetime] = None
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True
