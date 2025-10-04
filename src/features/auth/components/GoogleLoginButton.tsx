import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { RippleEffect } from '@/ui/effects/RippleEffect'

type Props = {
  onSuccess: (credentialResponse: CredentialResponse) => void
  onError: () => void
  disabled?: boolean
}

/**
 * GoogleLoginButton - Custom styled Google OAuth login button
 * White button with Google logo and Material Design ripple effect
 * Uses same border-radius as VersionPill (20px)
 */
export function GoogleLoginButton({ onSuccess, onError, disabled = false }: Props) {
  return (
    <RippleEffect
      color="rgba(66, 133, 244, 0.3)"
      disabled={disabled}
      style={{
        borderRadius: '20px',
        width: '250px',
        margin: '0 auto',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        userSelect: disabled ? 'none' : 'auto'
      }}
    >
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        logo_alignment="left"
        width="100%"
      />
    </RippleEffect>
  )
}