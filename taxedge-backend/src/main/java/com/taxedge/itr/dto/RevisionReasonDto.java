package com.taxedge.itr.dto;

import com.taxedge.itr.enums.RevisionReason;

import lombok.Data;

@Data
public class RevisionReasonDto {

	private String revisedItrId;

	private RevisionReason reason;

	private String otherReason;
}