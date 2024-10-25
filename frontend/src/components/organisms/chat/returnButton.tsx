import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button } from '@mui/material';

import { useAuth } from '../../../api/auth';

const FullScreenWrapper = styled(Box)`
  background-color: #ffffff;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ReturnButton = () => {
  const { user } = useAuth();

  const returnUrl = user?.metadata?.returnUrl ?? null;

  const calcSecondsRemaining = useCallback(() => {
    if (!user?.metadata?.exp) {
      return null;
    }
    const expiresIn = user?.metadata?.exp;
    let timeRemaining = expiresIn * 1000 - Date.now();
    timeRemaining = timeRemaining < 0 ? 0 : timeRemaining;
    return timeRemaining === 0 ? 0 : Math.round(timeRemaining / 1000);
  }, [user]);

  const secondsRemainingRef = useRef(calcSecondsRemaining());
  const [secondsRemaining, setSecondsRemaining] = useState(
    secondsRemainingRef.current
  );

  const { t } = useTranslation();

  const returnToSurvey = () => {
    window.location.href = returnUrl;
  };

  // Set up an interval to update the countdown every second
  useEffect(() => {
    if (secondsRemainingRef.current === null) {
      return;
    }
    if (Number(secondsRemainingRef.current) === 0) {
      return;
    }
    const interval = setInterval(() => {
      console.log('!!!secondsRemaining', secondsRemainingRef.current);

      if (Number(secondsRemainingRef.current) === 0) {
        console.log('!!!CLEARING INTERVAL');
        clearInterval(interval); // Clear the interval if time is up
        console.log('!!!RETURNING TO SURVEY');
        returnToSurvey();
        return;
      }

      secondsRemainingRef.current = calcSecondsRemaining();
      setSecondsRemaining(secondsRemainingRef.current);
    }, 500);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [calcSecondsRemaining]);

  const timerStr = useMemo(() => {
    if (!secondsRemaining) {
      return '';
    }
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    return ` (${minutesStr}:${secondsStr})`;
  }, [secondsRemaining]);

  if (!returnUrl) {
    return null;
  }

  const expired = secondsRemaining !== null && secondsRemaining <= 0;

  return expired ? (
    <FullScreenWrapper>
      <Button variant="contained" onClick={returnToSurvey}>
        {t('components.organisms.chat.returnButton', { timer: timerStr })}
      </Button>
    </FullScreenWrapper>
  ) : (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      <Button variant="contained" onClick={returnToSurvey}>
        {t('components.organisms.chat.returnButton', { timer: timerStr })}
      </Button>
    </Box>
  );
};
