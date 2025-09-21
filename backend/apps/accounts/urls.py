from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (
    RegisterView,
    EmailTokenObtainPairView,
    GoogleLoginView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordResetOTPRequestView,
    PasswordResetOTPVerifyView,
    PasswordResetWithOTPConfirmView,
    UsersSearchView,
    DeleteAccountView,
    NotificationSettingsView,
    DoNotDisturbView,
    ChangePasswordView,
    OTPLoginRequestView,
    OTPLoginVerifyView,
)


urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('auth/password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/password/otp/', PasswordResetOTPRequestView.as_view(), name='password_reset_otp_request'),
    path('auth/password/otp/verify/', PasswordResetOTPVerifyView.as_view(), name='password_reset_otp_verify'),
    path('auth/password/otp/confirm/', PasswordResetWithOTPConfirmView.as_view(), name='password_reset_otp_confirm'),
    path('auth/delete-account/', DeleteAccountView.as_view(), name='delete_account'),
    path('users/search/', UsersSearchView.as_view(), name='users_search'),
    path('notification-settings/', NotificationSettingsView.as_view(), name='notification_settings'),
    path('do-not-disturb/', DoNotDisturbView.as_view(), name='do_not_disturb'),
    path('auth/password/change/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/otp/login/', OTPLoginRequestView.as_view(), name='otp_login_request'),
    path('auth/otp/verify/', OTPLoginVerifyView.as_view(), name='otp_login_verify'),
]


