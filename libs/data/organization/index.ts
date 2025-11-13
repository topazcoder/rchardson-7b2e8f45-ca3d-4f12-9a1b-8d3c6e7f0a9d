export type OrganizationCreateDto = {
  name: string;
  parentId?: string;
};

export type OrganizationUpdateDto = {
  name?: string;
};
