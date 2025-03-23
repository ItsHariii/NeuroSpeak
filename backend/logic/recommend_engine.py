from services.firestore import get_user_emoji_clicks
from core.time_utils import get_time_bucket
from collections import Counter
from datetime import datetime

def get_recommended_emojis(user_id: str) -> list[str]:
    all_clicks = get_user_emoji_clicks(user_id)
    now = datetime.now()
    current_bucket = get_time_bucket(now)

    filtered = [c["emoji"] for c in all_clicks if get_time_bucket(datetime.fromisoformat(c["timestamp"])) == current_bucket]
    most_common = Counter(filtered).most_common(5)
    return [emoji for emoji, _ in most_common]