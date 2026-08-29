from sqlalchemy import Column, Integer, String
from app.database import Base

class RedSocialModel(Base):
    __tablename__ = "red_social"

    id_red_social = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    url_base = Column(String, nullable=False)