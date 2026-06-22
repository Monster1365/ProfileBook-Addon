import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getProfiles, saveProfiles } from "./util.js";

export async function createProfile(player) {
  const form = new ModalFormData()
    .title("프로필 생성")
    .textField("프로필 제목", "")
    .textField("이름", "")
    .textField("성별 / 나이", "")
    .textField("소개1", "")
    .textField("소개2", "")
    .textField("소개3", "");

  const result = await form.show(player);

  if (result.canceled) return;

  const profileTitle = result.formValues[0];
  const profileName = result.formValues[1];
  const profileAge = result.formValues[2];
  const profileInfo1 = result.formValues[3];
  const profileInfo2 = result.formValues[4];
  const profileInfo3 = result.formValues[5];

  // 현재 프로필 불러오기
  const profiles = getProfiles();

  profiles.push({
    id: Date.now().toString(),
    owner: player.name,
    title: profileTitle,
    name: profileName,
    age: profileAge,
    info1: profileInfo1,
    info2: profileInfo2,
    info3: profileInfo3,
    equipped: false,
  });

  // 현재 프로필에 새로 만든 프로필을 추가 한 후 저장
  saveProfiles(profiles);

  player.sendMessage("§a[+]프로필이 저장되었습니다!");
}

export async function listProfiles(player) {
  const profiles = getProfiles();
  const equippedProfiles = profiles.filter((p) => p.equipped === true);

  const form = new ActionFormData().title("프로필 목록");

  // 반복으로 장착된 프로필만 폼에 추가
  for (const profile of equippedProfiles) {
    form.button(`§e[${profile.owner}] §r[${profile.name}] [${profile.age}]`);
  }

  const result = await form.show(player);

  if (result.canceled) return;

  const selectedProfile = equippedProfiles[result.selection];

  const detailForm = new ActionFormData()
    .title(
      `§e[${selectedProfile.owner}] §r[${selectedProfile.name}] [${selectedProfile.age}]`,
    )
    .body(
      `== 정보 ==\n[이름] ${selectedProfile.name}\n[성별/나이] ${selectedProfile.age}\n\n== 소개 ==\n${selectedProfile.info1}\n${selectedProfile.info2}\n${selectedProfile.info3}\n`,
    )
    .button("§c닫기");

  const detailFormResult = await detailForm.show(player);

  if (detailFormResult.canceled) return;
}

export async function showMyProfiles(player) {
  const profiles = getProfiles();
  const myProfiles = profiles.filter((p) => p.owner === player.name);

  // 장착된 프포필이 맨 위로가게 정렬
  myProfiles.sort((a, b) => {
    if (a.equipped && !b.equipped) return -1;
    if (!a.equipped && b.equipped) return 1;
    return 0;
  });

  // 프로필 만든게 없으면 메시지와 함꼐 메뉴 닫음
  if (myProfiles.length === 0) {
    player.sendMessage("§c[-]생성한 프로필이 없습니다.");
    return;
  }

  const form = new ActionFormData().title("내 프로필");

  // 반복 돌면서 내 프로필만 폼에 추가
  for (const profile of myProfiles) {
    let buttonText = `<${profile.title}> ${profile.name}`;
    if (profile.equipped) {
      buttonText = `§a[장착됨] <${profile.title}> ${profile.name}`;
    }
    form.button(buttonText);
  }

  const result = await form.show(player);

  if (result.canceled) return;

  const selectedProfile = myProfiles[result.selection];

  const detailForm = new ActionFormData()
    .title(selectedProfile.title)
    .body(
      `== 정보 ==\n[이름] ${selectedProfile.name}\n[성별/나이] ${selectedProfile.age}\n\n== 소개 ==\n${selectedProfile.info1}\n${selectedProfile.info2}\n${selectedProfile.info3}`,
    )
    .button("장착")
    .button("해제")
    .button("수정")
    .button("§c삭제");

  const detailFromResult = await detailForm.show(player);
  if (detailFromResult.canceled) return;

  // 프로필 장착
  if (detailFromResult.selection === 0) {
    for (const profile of myProfiles) {
      profile.equipped = false;
    }
    selectedProfile.equipped = true;
    saveProfiles(profiles);
  }
  // 프로필 해제
  else if (detailFromResult.selection === 1) {
    selectedProfile.equipped = false;
    saveProfiles(profiles);
  }
  // 프로필 수정
  else if (detailFromResult.selection === 2) {
    const editForm = new ModalFormData()
      .title("프로필 수정")
      .textField("프로필 제목", selectedProfile.title)
      .textField("이름", selectedProfile.name)
      .textField("성별 / 나이", selectedProfile.age)
      .textField("소개1", selectedProfile.info1)
      .textField("소개2", selectedProfile.info2)
      .textField("소개3", selectedProfile.info3);

    const editResult = await editForm.show(player);

    if (editResult.canceled) return;

    if (editResult.formValues[0]) {
      selectedProfile.title = editResult.formValues[0];
    }
    if (editResult.formValues[1]) {
      selectedProfile.name = editResult.formValues[1];
    }
    if (editResult.formValues[2]) {
      selectedProfile.age = editResult.formValues[2];
    }
    if (editResult.formValues[3]) {
      selectedProfile.info1 = editResult.formValues[3];
    }
    if (editResult.formValues[4]) {
      selectedProfile.info2 = editResult.formValues[4];
    }
    if (editResult.formValues[5]) {
      selectedProfile.info3 = editResult.formValues[5];
    }

    saveProfiles(profiles);
    player.sendMessage("§a[+]프로필 수정 완료!");
  }
  // 프로필 삭제
  else if (detailFromResult.selection === 3) {
    const index = profiles.findIndex((p) => p.id === selectedProfile.id);
    if (index !== -1) {
      profiles.splice(index, 1);
      saveProfiles(profiles);
      player.sendMessage("§a[+]프로필 삭제 완료.");
      return;
    }
  }
}

export async function showAdminPanel(player) {
  const profiles = getProfiles();
  const form = new ActionFormData()
    .title("관리자 패널")
    .button("전체 프로필 관리")
    .button("프로필 모두 삭제");

  const adminFormResult = await form.show(player);

  if (adminFormResult.canceled) return;

  if (adminFormResult.selection === 0) {
    const profileForm = new ActionFormData().title("전체 프로필 관리");

    for (const profile of profiles) {
      profileForm.button(
        `§e[${profile.owner}] §r[${profile.name}] [${profile.age}]`,
      );
    }

    const profileResult = await profileForm.show(player);

    if (profileResult.canceled) return;

    const selectedProfile = profiles[profileResult.selection];

    const detailForm = new ActionFormData()
      .title(
        `§e[${selectedProfile.owner}] §r[${selectedProfile.name}] [${selectedProfile.age}]`,
      )
      .body(
        `== 디테일 ==\n[닉네임] ${selectedProfile.owner}\n[제목] ${selectedProfile.title}\n\n== 정보 ==\n[이름] ${selectedProfile.name}\n[성별/나이] ${selectedProfile.age}\n\n== 소개 ==\n${selectedProfile.info1}\n${selectedProfile.info2}\n${selectedProfile.info3}\n`,
      )
      .button("닫기")
      .button("§c삭제");

    const detailResult = await detailForm.show(player);

    if (detailResult.canceled) return;

    if (detailResult.selection === 1) {
      const index = profiles.findIndex((p) => p.id === selectedProfile.id);
      if (index !== -1) {
        profiles.splice(index, 1);
        saveProfiles(profiles);
        player.sendMessage("§e[OP]프로필 삭제 완료.");
        return;
      }
    }
  } else if (adminFormResult.selection === 1) {
    saveProfiles([]);
    player.sendMessage("§e[OP]모든 프로필 삭제 완료.");
    return;
  }
}
