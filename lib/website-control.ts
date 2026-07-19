export const websiteSections = [
  'home',
  'best-sellers',
  'rooms',
  'booking',
  'menu',
  'packages',
  'about',
  'gallery',
  'contact',
] as const

export const bookingFields = [
  'room',
  'date',
  'time',
  'duration',
  'players',
  'extras',
  'name',
  'phone',
] as const

export const websiteControlFunctionDeclarations = [
  {
    name: 'scroll_to_section',
    description:
      'Scroll the visible website to an approved section only when the guest explicitly asks to see, open, or scroll to that section.',
    parametersJsonSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        section: {
          type: 'string',
          enum: websiteSections,
          description: 'The approved website section to reveal.',
        },
      },
      required: ['section'],
    },
  },
  {
    name: 'focus_booking_field',
    description:
      'Scroll to the booking form and focus one field when the guest explicitly asks for help entering that detail. Do not fill or submit fields with this tool.',
    parametersJsonSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        field: {
          type: 'string',
          enum: bookingFields,
          description: 'The booking field to focus.',
        },
      },
      required: ['field'],
    },
  },
] as const

export type WebsiteSection = (typeof websiteSections)[number]
export type BookingField = (typeof bookingFields)[number]
