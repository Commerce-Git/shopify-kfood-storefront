import * as React from "react";
import { Link } from "@react-email/components";
import { BUSINESS } from "../../../lib/config/business";

/** Public seller details only; unsubscribe controls remain in each template. */
export function SellerIdentity() {
  return <>
    {BUSINESS.name}
    <br />
    {BUSINESS.address}
    <br />
    <Link href={`mailto:${BUSINESS.email}`} style={{ color: "inherit", textDecoration: "underline" }}>
      {BUSINESS.email}
    </Link>
  </>;
}
