import { Button, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between gap-x-2">
      <div>
        <Text className="font-semibold text-ui-fg-base whitespace-nowrap text-sm small:text-base">
          Already have an account?
        </Text>
        <Text className="text-xs small:text-sm text-ui-fg-subtle whitespace-nowrap">
          Sign in to save time at checkout.
        </Text>
      </div>
      <LocalizedClientLink href="/account">
        <Button
          variant="secondary"
          className="h-9 small:h-10 px-3 small:px-4 text-sm"
          data-testid="sign-in-button"
        >
          Sign in
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
