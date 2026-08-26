const atm_types = [
  { value: "CRM", label: "CRM" },
  { value: "CRM2", label: "CRM2"},
  { value: "NCR", label: "NCR" },
];

const sites = [
  { value: "Onsite", label: "Onsite" },
  { value: "Offsite", label: "Offsite" },
];
const pos_sites = [
  { value: "MERCHANT", label: "MERCHANT" },
  { value: "BRANCH", label: "BRANCH" },
];

const atm_status = [
  { value: "New", label: "New" },
  { value: "Active", label: "Active" },
  { value: "InActive", label: "InActive" },
  { value: "Relocated", label: "Relocated" },
  { value: "Stopped", label: "Stopped" },
];

const pos_status = [
  { value: "New", label: "New" },
  { value: "Active", label: "Active" },
  { value: "InActive", label: "InActive" },
  { value: "ToBeRelocated", label: "ToBeRelocated" },
  { value: "Relocated", label: "Relocated" },
  { value: "Stopped", label: "Stopped" },
];

const request_status = [
  { value: "New", label: "New" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Authorized", label: "Authorized" },
];

const districts = [
  { value: "Nekemte", label: "Nekemte" },
  { value: "Jimma", label: "Jimma" },
  { value: "Shashemene", label: "Shashemene" },
  { value: "Asella", label: "Asella" },
  { value: "Adama", label: "Adama" },
  { value: "Hawassa", label: "Hawassa" },
  { value: "Hossana", label: "Hossana" },
  { value: "Dire Dawa", label: "Dire Dawa" },
  { value: "Chiro", label: "Chiro" },
  { value: "Bale", label: "Bale" },
  { value: "East Finfine", label: "East Finfine" },
  { value: "Central Finfine", label: "Central Finfine" },
  { value: "North Finfine", label: "North Finfine" },
  { value: "South Finfine", label: "South Finfine" },
  { value: "West Finfine", label: "West Finfine" },
  { value: "Bahirdar", label: "Bahirdar" },
  { value: "Mekelle", label: "Mekelle" },
];

export {
  atm_types,
  sites,
  atm_status,
  pos_status,
  request_status,
  pos_sites,
  districts,
};
