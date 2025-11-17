-- @param {DateTime} $1:donatedAtGte?
-- @param {DateTime} $2:donatedAtLte?
-- @param {String} $3:donorIds?
-- @param {Float} $4:minAmount?
-- @param {Float} $5:maxAmount?
-- @param {String} $6:orderByField
-- @param {String} $7:orderDirection
-- @param {Int} $8:limit
-- @param {Int} $9:offset

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
	GROUP BY donor.id, donor."firstName", donor."lastName", donor."updatedAt", donor."externalId", donor.email
  HAVING
    ($4::float8 IS NULL OR COALESCE(SUM(donation.amount), 0) >= $4)
    AND ($5::float8 IS NULL OR COALESCE(SUM(donation.amount), 0) <= $5)
)
SELECT *, COUNT(*) OVER() AS "totalCount"
FROM donor_aggregates
ORDER BY
  CASE WHEN $6 = 'lastName' AND $7 = 'desc' THEN "lastName" END DESC,
  CASE WHEN $6 = 'lastName' AND $7 = 'asc' THEN "lastName" END ASC,
  CASE WHEN $6 = 'email' AND $7 = 'desc' THEN email END DESC,
  CASE WHEN $6 = 'email' AND $7 = 'asc' THEN email END ASC,
  CASE WHEN $6 = 'updatedAt' AND $7 = 'desc' THEN "updatedAt" END DESC,
  CASE WHEN $6 = 'updatedAt' AND $7 = 'asc' THEN "updatedAt" END ASC,
  CASE WHEN $6 = 'donationTotalAmount' AND $7 = 'desc' THEN "donationTotalAmount" END DESC,
  CASE WHEN $6 = 'donationTotalAmount' AND $7 = 'asc' THEN "donationTotalAmount" END ASC,
  CASE WHEN $6 = 'donationCount' AND $7 = 'desc' THEN "donationCount" END DESC,
  CASE WHEN $6 = 'donationCount' AND $7 = 'asc' THEN "donationCount" END ASC
LIMIT $8
OFFSET $9
