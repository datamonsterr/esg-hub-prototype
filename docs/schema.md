//// Database Schema for Supply Chain Traceability Platform

Table organizations {
  id int [pk, increment]
  name varchar(255) [not null]
  address text
  verification_status varchar(50) [default: 'unverified']
  created_at timestamptz [default: `now()`]
}

Table users {
  id int [pk, increment]
  organization_id int [not null, ref: > organizations.id]
  email varchar(255) [unique, not null]
  password_hash varchar(255) [not null]
  role varchar(50) [default: 'viewer']
}

Table components {
  id int [pk, increment]
  owner_organization_id int [not null, ref: > organizations.id]
  name varchar(255) [not null]
  sku varchar(100)
  type varchar(50) [not null, note: 'e.g., final_product, sub_assembly, material']
  
  indexes {
    (owner_organization_id, sku) [unique]
  }
}

Table bom_structure {
  parent_component_id int [not null, ref: > components.id]
  child_component_id int [not null, ref: > components.id]
  quantity_per_parent decimal(10, 4) [not null]

  indexes {
    (parent_component_id, child_component_id) [pk]
  }
}

Table assessment_templates {
  id int [pk, increment]
  created_by_organization_id int [not null, ref: > organizations.id]
  title varchar(255) [not null]
  schema jsonb [not null, note: 'Stores the form structure (questions, types)']
}

Table trace_requests {
  id int [pk, increment]
  target_component_id int [not null, ref: > components.id]
  requesting_organization_id int [not null, ref: > organizations.id]
  target_organization_id int [not null, ref: > organizations.id]
  assessment_template_id int [not null, ref: > assessment_templates.id]
  parent_request_id int [ref: > trace_requests.id, note: 'Self-referencing key for cascading trace']
  status varchar(50) [default: 'sent']
  created_at timestamptz [default: `now()`]
}

Table assessment_responses {
  id int [pk, increment]
  trace_request_id int [unique, not null, ref: > trace_requests.id]
  submitted_by_user_id int [not null, ref: > users.id]
  response_data jsonb [not null, note: 'Stores the actual answers to the form']
  created_at timestamptz [default: `now()`]
}
 Note that: components and products is the same concept