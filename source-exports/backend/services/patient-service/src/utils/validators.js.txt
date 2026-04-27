// Patient input validation for patient-service
// References validation logic from auth-service/src/utils/validators.js

// Regex and rules copied to keep validation consistent across services

function validatePatientInput(data) {
  const errors = {};

  // Full Name: Required, max 30 chars, no special chars/digits, spaces allowed
  if (!data.fullName) {
    errors.fullName = "Name is required";
  } else if (data.fullName.length > 30) {
    errors.fullName = "Name must not exceed 30 characters";
  } else if (!/^[A-Za-z ]+$/.test(data.fullName)) {
    errors.fullName = "Name cannot contain special characters or digits";
  }

  // Phone: .trim(), notEmpty, regex for mobile number
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim() === '') {
    errors.phone = "Mobile number is required";
  } else if (!/^(0[0-9]{9}|(77|76|74|78|75|71|70)[0-9]{7})$/.test(data.phone.trim())) {
    errors.phone = "Invalid mobile number";
  }

  // Address: (optional) .trim(), regex, max 100 chars
  if (data.address && typeof data.address === 'string' && data.address.trim() !== '') {
    if (!/^[A-Za-z0-9/\-,/. ]+$/.test(data.address.trim())) {
      errors.address = "Address can only contain letters, numbers, '/', and '-'";
    } else if (data.address.trim().length > 100) {
      errors.address = "Address must not exceed 100 characters";
    }
  }

  // Emergency Contact Name: (optional) max 30 chars, no special chars/digits, spaces allowed
  if (data.emergencyContactName && typeof data.emergencyContactName === 'string' && data.emergencyContactName.trim() !== '') {
    if (data.emergencyContactName.length > 30) {
      errors.emergencyContactName = "Name must not exceed 30 characters";
    } else if (!/^[A-Za-z ]+$/.test(data.emergencyContactName)) {
      errors.emergencyContactName = "Name cannot contain special characters or digits";
    }
  }

  // Emergency Contact Phone: (optional) Use same as phone field
  if (data.emergencyContactPhone && typeof data.emergencyContactPhone === 'string' && data.emergencyContactPhone.trim() !== '') {
    if (!/^(0[0-9]{9}|(77|76|74|78|75|71|70)[0-9]{7})$/.test(data.emergencyContactPhone.trim())) {
      errors.emergencyContactPhone = "Invalid mobile number";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export default validatePatientInput;
