module.exports = (record) => {
    return {
        creditorSignature: record.creditorSignature,
        debtorSignature: record.debtorSignature,
        transaction: {
            creditorAddress: record.transaction.creditorAddress,
            debtorAddress: record.transaction.debtorAddress,
            ucacAddress: record.transaction.ucacAddress,
            amount: record.transaction.amount,
            memo: record.transaction.memo,
            nonce: record.transaction.nonce
        }
    }
}
