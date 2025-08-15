import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function useTelegramCounts() {
    const [counts, setCounts] = useState({ groups: 0, users: 0 });

    useEffect(() => {
        let ignore = false;

        const fetchCounts = async () => {
            try {
                const { data } = await api.get("/telegram/groups");

                let groups = 0;
                let users = 0;

                if (Array.isArray(data)) {
                    groups = data.length;
                    users = data.reduce((sum, g) => {
                        if (g) {
                            const u = g.users?.length || g.users_count || g.user_count || 0;
                            return sum + (typeof u === "number" ? u : 0);
                        }
                        return sum;
                    }, 0);
                } else if (data) {
                    groups = data.groups ?? data.groupCount ?? data.total ?? 0;
                    users = data.users ?? data.userCount ?? 0;
                }

                if (!ignore) {
                    setCounts({ groups, users });
                }
            } catch (e) {
                if (!ignore) {
                    setCounts({ groups: 0, users: 0 });
                }
            }
        };

        fetchCounts();

        return () => {
            ignore = true;
        };
    }, []);

    return counts;
}
