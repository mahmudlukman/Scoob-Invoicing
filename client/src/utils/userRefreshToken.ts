import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useRefreshTokenMutation } from "../redux/features/api/apiSlice";
import type { RootState } from "../@types";

export const useTokenRefresh = () => {
  const [refreshToken] = useRefreshTokenMutation();
  const { user } = useSelector((state: RootState) => state.auth);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    const refreshInterval = 14 * 60 * 1000;

    intervalRef.current = setInterval(() => {
      refreshToken({})
        .unwrap()
        .catch(() => {});
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, refreshToken]);
};
