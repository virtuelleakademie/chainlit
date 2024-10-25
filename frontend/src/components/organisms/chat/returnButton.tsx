import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button } from '@mui/material';

import { useAuth } from '../../../api/auth';

export const ReturnButton = () => {
  const { user } = useAuth();
  console.log('!!!user', user);
  const returnUrl = user?.metadata?.returnUrl ?? null;
  const expiresIn = user?.metadata?.exp ?? Date.now() / 1000 + 5000;
  let timeRemaining = expiresIn * 1000 - Date.now();
  timeRemaining = timeRemaining < 0 ? 0 : timeRemaining;
  timeRemaining = Math.round(timeRemaining / 1000);
  console.log('!!!expiresIn', expiresIn);
  console.log('!!!timeRemaining', timeRemaining);
  const secondsRemainingRef = useRef(timeRemaining);
  const [secondsRemaining, setSecondsRemaining] = useState(timeRemaining);

  const { t } = useTranslation();

  const returnToSurvey = () => {
    window.location.href = returnUrl;
  };

  // Set up an interval to update the countdown every second
  useEffect(() => {
    if (secondsRemaining <= 0) {
      returnToSurvey();
      return;
    }
    const interval = setInterval(() => {
      if (secondsRemainingRef.current <= 0) {
        clearInterval(interval); // Clear the interval if time is up
        returnToSurvey();
        return;
      }
      // Decrease the seconds and update state
      secondsRemainingRef.current -= 1;
      setSecondsRemaining(secondsRemainingRef.current);
    }, 1000); // Run every second (1000 ms)

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const timerStr = useMemo(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    return ` (${minutesStr}:${secondsStr})`;
  }, [secondsRemaining]);

  if (!returnUrl) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      <Button variant="contained" onClick={returnToSurvey}>
        {t('components.organisms.chat.returnButton', { timer: timerStr })}
      </Button>
    </Box>
  );
};
