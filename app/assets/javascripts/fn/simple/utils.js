fn.utils.is_fake_field = function (field) {
  return field.match(/iroki_fake_[12]/);
};

fn.utils.is_sample_field = function (field) {
  return field !== "name" && !fn.utils.is_fake_field(field);
};