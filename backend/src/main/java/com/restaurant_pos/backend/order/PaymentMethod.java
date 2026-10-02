package com.restaurant_pos.backend.order;
public enum PaymentMethod {
    CASH,
    KBZ_PAY,
    /**
     * Legacy value retained so previously persisted completed orders remain readable.
     */
    E_WALLET
}
