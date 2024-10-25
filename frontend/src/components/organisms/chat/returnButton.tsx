import {useCallback, useEffect, useMemo, useState} from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button } from '@mui/material';

import { useAuth } from '../../../api/auth';

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
    return Math.round(timeRemaining / 1000);
  }, [user]);

  const [secondsRemaining, setSecondsRemaining] = useState(calcSecondsRemaining());

  const { t } = useTranslation();

  const returnToSurvey = () => {
    window.location.href = returnUrl;
  };

  // Set up an interval to update the countdown every second
  useEffect(() => {
    if (secondsRemaining === null) {
      return;
    }
    if (secondsRemaining <= 0) {
      returnToSurvey();
      return;
    }
    const interval = setInterval(() => {
      if (secondsRemaining <= 0) {
        clearInterval(interval); // Clear the interval if time is up
        returnToSurvey();
        return;
      }

      setSecondsRemaining(calcSecondsRemaining());
    }, 1000); // Run every second (1000 ms)

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

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

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      <Button variant="contained" onClick={returnToSurvey}>
        {t('components.organisms.chat.returnButton', { timer: timerStr })}
      </Button>
    </Box>
  );
};
