Field = function(z, bundle) {

  if (bundle) {
    this.route = bundle.authData.baseUrl+'/api/fields';
  }

  this.getContactCoreFields = (autogenerated) => {
    const fields = [
      {key: 'lastActive', label: 'Last Active Date', type: 'datetime'},
      {key: 'points', label: 'Points', type: 'integer'},
      {key: 'tags', label: 'Tags', helpText: 'Comma separated tags. Use - before the tag if you want to remove it'},
    ];

    const autogeneratedFields = [
      {key: 'id', label: 'ID', type: 'integer'},
      {key: 'ownedByUsername', label: 'OwnedBy Username'},
      {key: 'ownedByUser', label: 'OwnedBy User'},
      {key: 'ownedBy', label: 'OwnedBy ID', type: 'integer'},
      {key: 'modifiedByUser', label: 'Modified By User'},
      {key: 'modifiedBy', label: 'Modified By ID', type: 'integer'},
      {key: 'createdByUser', label: 'Created By User'},
      {key: 'createdBy', label: 'Created By ID', type: 'integer'},
      {key: 'dateIdentified', label: 'Date Identified', type: 'datetime'},
      {key: 'dateModified', label: 'Date Modified', type: 'datetime'},
      {key: 'dateAdded', label: 'Date Added', type: 'datetime'},
    ];

    if (autogenerated) {
      return fields.concat(autogeneratedFields);
    }

    return fields;
  };

  this.convertMauticOptionsToZapierOptions = (mauticList) => {
    var zapierList = {};

    for (var key in mauticList) {
      var option = mauticList[key];
      zapierList[option.value] = option.label;
    }

    return zapierList;
  };

  this.simplifyFieldArray = (response, autogenerated) => {
    const contact = new Contact();
    const fields = this.getContactCoreFields(autogenerated);
    if (response && response.fields) {
      for (var key in response.fields) {
        var mField = response.fields[key];
        var zField = {key: mField.alias, label: mField.label};

        if (mField.type === 'multiselect' && mField.properties.list) {
          zField.choices = this.convertMauticOptionsToZapierOptions(mField.properties.list);
          zField.list = true; // multiple values can be selected
        }

        if (mField.type === 'select' && mField.properties.list) {
          zField.choices = this.convertMauticOptionsToZapierOptions(mField.properties.list);
        }

        if (mField.type === 'boolean') {
          zField.choices = mField.properties;
        }

        fields.push(zField);
      }
    }
    return fields;
  };

  this.getList = (object, params, autogenerated) => {
    const options = {
      url: this.route+'/'+object,
      params: params,
    };

    return z.request(options)
      .then((response) => this.simplifyFieldArray(JSON.parse(response.content), autogenerated));
  };
};

module.exports = Field;
