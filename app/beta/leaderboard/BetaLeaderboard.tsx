"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, ArrowLeft, Search } from "lucide-react";
import styles from "../beta.module.css";

export type LeaderRow = {
  rank: number;
  ref: string;
  name: string;
  count: number;
  amount: number;
};

export function BetaLeaderboard({ leaders }: { leaders: LeaderRow[] }) {
  const [code, setCode] = useState("");
  const me = code.trim().toUpperCase();

  return (
    <div className={styles.wrap}>
      <div className={styles.lbStage}>
        <Link href="/beta" className={styles.lbBack}>
          <ArrowLeft size={15} /> Back to beta
        </Link>

        <div className={styles.lbHead}>
          <span className={styles.lbBadge}>
            <Trophy size={14} /> Referral leaderboard
          </span>
          <h1 className={styles.lbTitle}>Top student referrers</h1>
          <p className={styles.lbSub}>
            Refer 10 friends who join and you earn &#8358;500 airtime, or cash.
            Every referral counts for &#8358;50. Type your referral code below to
            find your spot.
          </p>
        </div>

        <label className={styles.lbSearch}>
          <Search size={15} />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Your code, e.g. KLR-AB3CD"
            aria-label="Your referral code"
          />
        </label>

        {leaders.length === 0 ? (
          <p className={styles.lbEmpty}>
            No referrals yet. Be the first to share your link.
          </p>
        ) : (
          <ol className={styles.lbList}>
            {leaders.map((row) => {
              const isMe = me.length >= 3 && row.ref.toUpperCase() === me;
              return (
                <li
                  key={row.ref}
                  className={
                    isMe ? `${styles.lbItem} ${styles.lbItemMe}` : styles.lbItem
                  }
                >
                  <span className={styles.lbRank}>{row.rank}</span>
                  <div className={styles.lbName}>
                    <div className={styles.lbNm}>
                      {row.name}
                      {isMe ? " (you)" : ""}
                    </div>
                    <div className={styles.lbCode}>{row.ref}</div>
                  </div>
                  <div className={styles.lbCount}>
                    <div className={styles.lbNum}>
                      {row.count} ref{row.count === 1 ? "" : "s"}
                    </div>
                    <div className={styles.lbAmt}>
                      {`₦${row.amount.toLocaleString()}`}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
