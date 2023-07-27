using AdminService from '../../admin-service';

// ========================
// Projects
// ========================

// Projects can be maintained by Admin Service users
annotate AdminService.Projects {
    ID          @UI.Hidden  @readonly  @mandatory;
    validFrom                          @mandatory;
    validTo                            @mandatory;
    description @UI.HiddenFilter       @mandatory;
};

// ========================
// Assessments
// ========================

// Assessments cannot be maintained by Admin Service users
annotate AdminService.Assessments {
    ID               @UI.Hidden;
    description      @UI.HiddenFilter;
};

// ========================
// Members
// ========================

// Members can be maintained by Admin Service users
annotate AdminService.Members {
    ID @UI.Hidden @mandatory;
    project @mandatory;
    user @mandatory;
};



// ========================
// Users
// ========================

// Users can be maintained by Admin Service users
annotate AdminService.Users {
    ID        @UI.Hidden @readonly;
    fullName  @UI.HiddenFilter @readonly;
    email     @UI.HiddenFilter @Core.Immutable @mandatory;
    firstName @UI.HiddenFilter @Core.Immutable @mandatory;
    lastName  @UI.HiddenFilter @Core.Immutable @mandatory;
    role                                       @mandatory;
};
