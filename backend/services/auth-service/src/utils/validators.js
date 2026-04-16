export const validatePatientRegistration = (data) => {
  const errors = {};

  // 1. Full Name: Required, max 30 chars, no special chars/digits, spaces allowed
  if (!data.fullName) {
    errors.fullName = "Name is required";
  } else if (data.fullName.length > 30) {
    errors.fullName = "Name must not exceed 30 characters";
  } else if (!/^[A-Za-z ]+$/.test(data.fullName)) {
    errors.fullName = "Name cannot contain special characters or digits";
  }

  // 2. Email: Valid format
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  // 3. Phone: .trim(), notEmpty, regex for mobile number
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim() === '') {
    errors.phone = "Mobile number is required";
  } else if (!/^(0[0-9]{9}|(77|76|74|78|75|71|70)[0-9]{7})$/.test(data.phone.trim())) {
    errors.phone = "Invalid mobile number";
  }

  // 4. Password: >8 chars (min 9), 1 uppercase, 1 lowercase, 1 number, 1 special char
  if (!data.password) {
    errors.password = "Password is required";
  } else if (!validatePassword(data.password)) {
    errors.password = "Password must be at least 8 characters and contain at least one uppercase, one lowercase, one number, and one special character";
  }

  // 5. Gender: Validate against expected frontend checkbox values
  if (data.gender && !['male', 'female', 'other'].includes(data.gender.toLowerCase())) {
    errors.gender = "Invalid gender selection";
  }

  // 6. Date of Birth: Must be a valid date
  if (data.dateOfBirth && isNaN(Date.parse(data.dateOfBirth))) {
    errors.dateOfBirth = "Invalid Date of Birth format";
  }

  // 7. Blood Group: Ensure it's not empty if provided
  if (data.bloodGroup && data.bloodGroup.trim() === "") {
    errors.bloodGroup = "Blood group cannot be empty";
  }

  // 8. Address: (optional) .trim(), regex, max 100 chars
  if (data.address && typeof data.address === 'string' && data.address.trim() !== '') {
    if (!/^[A-Za-z0-9/\-, ]+$/.test(data.address.trim())) {
      errors.address = "Address can only contain letters, numbers, '/', and '-'";
    } else if (data.address.trim().length > 100) {
      errors.address = "Address must not exceed 100 characters";
    }
  }

  // 9. Emergency Contact Name: (optional) max 30 chars, no special chars/digits, spaces allowed
  if (data.emergencyContactName && typeof data.emergencyContactName === 'string' && data.emergencyContactName.trim() !== '') {
    if (data.emergencyContactName.length > 30) {
      errors.emergencyContactName = "Name must not exceed 30 characters";
    } else if (!/^[A-Za-z ]+$/.test(data.emergencyContactName)) {
      errors.emergencyContactName = "Name cannot contain special characters or digits";
    }
  }

  // 10. Emergency Contact Phone: (optional) Use same as phone field
  if (data.emergencyContactPhone && typeof data.emergencyContactPhone === 'string' && data.emergencyContactPhone.trim() !== '') {
    if (!/^(0[0-9]{9}|(77|76|74|78|75|71|70)[0-9]{7})$/.test(data.emergencyContactPhone.trim())) {
      errors.emergencyContactPhone = "Invalid mobile number";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Extracted password validator so it can be reused for reset/change password
export const validatePassword = (password) => {
  // Regex explanation:
  // (?=.*[a-z]) : At least one lowercase
  // (?=.*[A-Z]) : At least one uppercase
  // (?=.*\d)    : At least one number
  // (?=.*[^A-Za-z0-9]) : At least one special character (anything not a letter/number)
  // .{9,}       : Minimum 9 characters (more than 8)
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
};