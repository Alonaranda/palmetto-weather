import { useState } from "react";
import {
  Button,
  Notice,
  NoticeBody,
  NoticeTitle,
  Wrapper,
} from "./EmailRecommendationsButton.styles";

export interface EmailRecommendationsButtonProps {
  disabled?: boolean;
}

/**
 * Teaser CTA — the email-delivery feature itself is not built yet. When the
 * user clicks, we surface a friendly note hinting at the roadmap (and at the
 * candidate's eagerness to ship it on the team). Intentionally kept on the
 * client only, no network call.
 */
export function EmailRecommendationsButton({ disabled = false }: EmailRecommendationsButtonProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Wrapper>
      <Button type="button" onClick={() => setRevealed(true)} disabled={disabled}>
        Email me these recommendations
      </Button>
      {revealed ? (
        <Notice aria-live="polite">
          <NoticeTitle>Coming soon 🚀</NoticeTitle>
          <NoticeBody>
            This is a feature I would love to build next — a weekly digest of weather
            recommendations sent straight to your inbox. I'd be thrilled to ship it when I join your
            team.
          </NoticeBody>
        </Notice>
      ) : null}
    </Wrapper>
  );
}
