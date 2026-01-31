import { Text } from "@medusajs/ui"

const MedusaCTA = () => {
  const currentYear = new Date().getFullYear()

  return (
    <Text className="txt-compact-small-plus text-ui-fg-muted">
      © {currentYear} RuggyLand
    </Text>
  )
}

export default MedusaCTA
