const formatL = (ds) => {
    if (!ds) return "";
    const d = new Date(ds + "T12:00:00");
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Data given by user
const policy_payment_limit = "2026-03-31";
const msi_start_date = "2026-03-01";
const msi_end_date = "2026-03-31";
const msi_active = true;

// Simulation of "Today"
const now = new Date("2026-03-26T18:00:00"); // Mar 26, 18:00

// LOGIC START
const paymentLimitMinus10 = new Date(policy_payment_limit + "T12:00:00");
paymentLimitMinus10.setDate(paymentLimitMinus10.getDate() - 10);
const paymentLimitMinus10StrFormat = paymentLimitMinus10.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

console.log("paymentLimitMinus10:", paymentLimitMinus10StrFormat); // Should be Mar 21

let msiApplies = false;
let promoDateToShowStr = paymentLimitMinus10StrFormat;

const promoStartDate = new Date(msi_start_date + "T00:00:00");
const promoEndDate = new Date(msi_end_date + "T23:59:59");

const nowNoTime = new Date(now);
nowNoTime.setHours(0, 0, 0, 0);

const promoStartNoTime = new Date(promoStartDate);
promoStartNoTime.setHours(0, 0, 0, 0);

const promoEndNoTime = new Date(promoEndDate);
promoEndNoTime.setHours(0, 0, 0, 0);

const paymentLimitMinus10NoTime = new Date(paymentLimitMinus10);
paymentLimitMinus10NoTime.setHours(0, 0, 0, 0);

console.log("Checking ranges...");
console.log("nowNoTime:", nowNoTime.toISOString());
console.log("promoStartNoTime:", promoStartNoTime.toISOString());
console.log("promoEndNoTime:", promoEndNoTime.toISOString());
console.log("paymentLimitMinus10NoTime:", paymentLimitMinus10NoTime.toISOString());

if (nowNoTime >= promoStartNoTime && nowNoTime <= promoEndNoTime) {
    console.log("Within promotion range.");
    if (promoEndNoTime <= paymentLimitMinus10NoTime) {
        console.log("Rule A: End date <= Limit-10");
        msiApplies = true;
        promoDateToShowStr = formatL(msi_end_date);
    } else {
        console.log("Rule B: End date > Limit-10");
        if (nowNoTime > paymentLimitMinus10NoTime) {
            console.log("Sub-rule B.1: Today > Limit-10 -> Standard Template");
            msiApplies = false;
        } else {
            console.log("Sub-rule B.2: Today <= Limit-10 -> MSI Template");
            msiApplies = true;
            promoDateToShowStr = paymentLimitMinus10StrFormat;
        }
    }
} else {
    console.log("Outside promotion range.");
}

console.log("RESULT msiApplies:", msiApplies);
console.log("RESULT promoDateToShowStr:", promoDateToShowStr);
