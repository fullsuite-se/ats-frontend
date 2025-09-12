// src/pages/Configurations.jsx
import { useState, useEffect } from 'react';
import GdriveConfig from '../components/Gdrive';
import SMTPConfiguration from '../components/SmtpConfig.';
import api from '../services/api';
import useUserStore from '../context/userStore';
import Loader from '../components/Loader';
import GoogleCalenderConfig from '../components/GoogleCalenderConfig';

const Configurations = () => {
  const [hasGdriveConfig, setHasGdriveConfig] = useState(false);
  const [hasSmtpConfig, setHasSmtpConfig] = useState(false);
  const [hasGoogleCalendarConfig, setHasGoogleCalendarConfig] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user, hasFeature } = useUserStore();

  const canSMTPConfiguration = hasFeature('SMTP Configuration');
  const canGoogleDriveConfiguration = hasFeature('Google Drive Configuration');
  const canGoogleCalendarConfiguration = hasFeature('Google Calendar Configuration');

  useEffect(() => {
    const checkConfigurations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const companyId = user.company_id;
        const userId = user.user_id;

        // Check Google Drive configuration
        try {
          const gdriveResponse = await api.get(`/user-configuration/gdrive/get-credentials/${companyId}`);
          // backend may return { data: true } or object; normalize to boolean
          setHasGdriveConfig(Boolean(gdriveResponse.data === true || gdriveResponse.data?.connected === true));
        } catch (gdriveError) {
          setHasGdriveConfig(false);
        }

        // Check SMTP configuration separately
        try {
          const smtpResponse = await api.get(`/user-configuration/smtp/get-credentials/${userId}`);
          setHasSmtpConfig(Boolean(smtpResponse.data === true || smtpResponse.data?.configured === true));
        } catch (smtpError) {
          setHasSmtpConfig(false);
        }

        // Check Google Calendar configuration
        try {
          const calResponse = await api.get(`/user-configuration/google-calendar/get-credentials/${companyId}`);
          setHasGoogleCalendarConfig(Boolean(calResponse.data === true || calResponse.data?.connected === true));
        } catch (calError) {
          setHasGoogleCalendarConfig(false);
        }
      } catch (error) {
        console.error('General error checking configurations:', error);
      } finally {
        setLoading(false);
      }
    };

    checkConfigurations();
  }, [user]);

  if (!user) {
    return <div className="text-center py-10">Please log in to view configurations</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader
            type="spinner"
            size="xl"
            color="#008080"
            text="Loading configurations..."
            fullScreen={false}
            className="mx-auto"
            theme="teal"
          />
        </div>
      ) : (
        <div className="flex w-full justify-center mx-auto max-w-6xl gap-8 flex-col md:flex-row">
          {/* SMTP */}
          {canSMTPConfiguration && (
            <div className="w-full md:w-1/3">
              {hasSmtpConfig && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-yellow-700">
                    You already have SMTP configurations. Proceeding will modify your existing settings.
                  </p>
                </div>
              )}
              <SMTPConfiguration />
            </div>
          )}

          {/* Google Drive */}
          {canGoogleDriveConfiguration && (
            <div className="w-full md:w-1/3">
              {hasGdriveConfig && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-yellow-700">
                    You already have Google Drive configurations. Proceeding will modify your existing settings.
                  </p>
                </div>
              )}
              <GdriveConfig />
            </div>
          )}

          {/* Google Calendar */}
          {canGoogleCalendarConfiguration && (
            <div className="w-full md:w-1/3">
              {hasGoogleCalendarConfig && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-yellow-700">
                    You already have Google Calendar configurations. Proceeding will modify your existing settings.
                  </p>
                </div>
              )}
              <GoogleCalenderConfig />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Configurations;
