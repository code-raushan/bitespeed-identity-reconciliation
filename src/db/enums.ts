export const Precedence = {
    primary: "primary",
    secondary: "secondary"
} as const;
export type Precedence = (typeof Precedence)[keyof typeof Precedence];
