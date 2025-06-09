export const createQuickRideData = (customer) => {
    const locationParts = customer.location.split(" → ")
    const fromLocation = locationParts[0] || customer.location
    const toLocation = locationParts[1] || ""
  
    return {
      prefillData: {
        customerName: customer.customerName,
        contactNumber: customer.contactNumber || "",
        fromLocation: fromLocation,
        toLocation: toLocation,
        amount: customer.amount.toString(),
        cost: customer.cost.toString(),
        save: customer.save.toString(),
        date: new Date().toISOString().split("T")[0],
      },
      isQuickRide: true,
    }
  }
  