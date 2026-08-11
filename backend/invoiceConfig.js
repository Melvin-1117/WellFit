/**
 * Invoice configuration — placeholder business details.
 * The client should fill in real values before going live.
 * If `gstin` is left empty, the GSTIN line is omitted from the invoice entirely.
 */
module.exports = {
  businessName: "WellFit",
  addressLine: "TODO: add registered business address",
  supportEmail: "TODO: add support email",
  gstin: "", // leave blank unless client provides one; omit the GSTIN
             // line entirely on the invoice if this is empty
};
