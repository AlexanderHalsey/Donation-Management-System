-- @param {DateTime} $1:donatedAtGte?
-- @param {DateTime} $2:donatedAtLte?
-- @param {String} $3:donorIds?
-- @param {Boolean} $4:isDisabled?
-- @param {Float} $5:minAmount?
-- @param {Float} $6:maxAmount?
-- @param {String} $7:orderByField
-- @param {String} $8:orderDirection
-- @param {Int} $9:limit
-- @param {Int} $10:offset

WITH donor_aggregates AS (
	SELECT
		donor.id,
		donor."firstName",
		donor."lastName",
		donor."updatedAt",
		donor."externalId",
		donor.email,
		donor."isDisabled",
		SUM(donation.amount) AS "donationTotalAmount",
		COUNT(donation.id) AS "donationCount"
	FROM "Donor" donor
	INNER JOIN "Donation" donation
		ON donor.id = donation."donorId"
		AND ($1::timestamp IS NULL OR donation."donatedAt" >= $1)
		AND ($2::timestamp IS NULL OR donation."donatedAt" <= $2)
	WHERE
		($3::text IS NULL OR donor.id::text = ANY(string_to_array($3::text, ',')))
		AND ($4::boolean IS NULL OR donor."isDisabled" = $4)
	GROUP BY donor.id, donor."firstName", donor."lastName", donor."updatedAt", donor."externalId", donor.email
  HAVING
    ($5::float8 IS NULL OR COALESCE(SUM(donation.amount), 0) >= $5)
    AND ($6::float8 IS NULL OR COALESCE(SUM(donation.amount), 0) <= $6)
)
SELECT *, COUNT(*) OVER() AS "totalCount"
FROM donor_aggregates
ORDER BY
  CASE WHEN $7 = 'lastName' AND $8 = 'desc' THEN "lastName" END DESC,
  CASE WHEN $7 = 'lastName' AND $8 = 'asc' THEN "lastName" END ASC,
  CASE WHEN $7 = 'email' AND $8 = 'desc' THEN email END DESC,
  CASE WHEN $7 = 'email' AND $8 = 'asc' THEN email END ASC,
  CASE WHEN $7 = 'updatedAt' AND $8 = 'desc' THEN "updatedAt" END DESC,
  CASE WHEN $7 = 'updatedAt' AND $8 = 'asc' THEN "updatedAt" END ASC,
  CASE WHEN $7 = 'donationTotalAmount' AND $8 = 'desc' THEN "donationTotalAmount" END DESC,
  CASE WHEN $7 = 'donationTotalAmount' AND $8 = 'asc' THEN "donationTotalAmount" END ASC,
  CASE WHEN $7 = 'donationCount' AND $8 = 'desc' THEN "donationCount" END DESC,
  CASE WHEN $7 = 'donationCount' AND $8 = 'asc' THEN "donationCount" END ASC
LIMIT $9
OFFSET $10
