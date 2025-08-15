"use client";

import React from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  useDisclosure,
} from "@heroui/react";

export default function HeroUITestPage() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">HeroUI 테스트</h1>
        <p className="text-default-500">
          설치 및 렌더링 확인용 데모 컴포넌트 모음
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-col items-start gap-1">
            <h2 className="text-lg font-semibold">Buttons / Tooltip / Badge</h2>
            <p className="text-small text-default-500">
              기본 버튼과 배지, 툴팁
            </p>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-3 items-center">
            <Button color="primary">Primary</Button>
            <Button color="secondary" variant="flat">
              Secondary
            </Button>
            <Button color="danger" variant="bordered">
              Danger
            </Button>
            <Tooltip content="툴팁 내용">
              <Button variant="light">Tooltip</Button>
            </Tooltip>
            <Badge color="danger" content={5}>
              <Button>알림</Button>
            </Badge>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-start gap-1">
            <h2 className="text-lg font-semibold">Inputs / Select</h2>
            <p className="text-small text-default-500">입력 및 선택 컴포넌트</p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Input label="이메일" placeholder="name@example.com" type="email" />
            <Input label="비밀번호" placeholder="••••••••" type="password" />
            <Select label="선택" className="max-w-xs">
              <SelectItem key="a">옵션 A</SelectItem>
              <SelectItem key="b">옵션 B</SelectItem>
              <SelectItem key="c">옵션 C</SelectItem>
            </Select>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-start gap-1">
            <h2 className="text-lg font-semibold">Checks / Switch / Radio</h2>
            <p className="text-small text-default-500">토글 및 선택</p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Checkbox defaultSelected>동의합니다</Checkbox>
              <Switch defaultSelected>사용</Switch>
            </div>
            <RadioGroup
              label="라디오 그룹"
              orientation="horizontal"
              defaultValue="1"
            >
              <Radio value="1">하나</Radio>
              <Radio value="2">둘</Radio>
              <Radio value="3">셋</Radio>
            </RadioGroup>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-start gap-1">
            <h2 className="text-lg font-semibold">Tabs / Popover</h2>
            <p className="text-small text-default-500">탭 전환과 팝오버</p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Tabs aria-label="데모 탭">
              <Tab key="tab1" title="탭 1">
                <div className="text-small text-default-600">탭 1 내용</div>
              </Tab>
              <Tab key="tab2" title="탭 2">
                <div className="text-small text-default-600">탭 2 내용</div>
              </Tab>
              <Tab key="tab3" title="탭 3">
                <div className="text-small text-default-600">탭 3 내용</div>
              </Tab>
            </Tabs>
            <Popover placement="bottom">
              <PopoverTrigger>
                <Button variant="flat">Popover 열기</Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="px-2 py-1 text-small">팝오버 내용</div>
              </PopoverContent>
            </Popover>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-start gap-1">
            <h2 className="text-lg font-semibold">Modal</h2>
            <p className="text-small text-default-500">모달 열기/닫기</p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Button color="primary" onPress={onOpen}>
              모달 열기
            </Button>
            <Modal
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              placement="center"
              backdrop="blur"
              closeButton
              isDismissable={true}
              size="md"
              motionProps={{
                variants: {
                  enter: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.3,
                      ease: "easeOut",
                    },
                  },
                  exit: {
                    y: -20,
                    opacity: 0,
                    transition: {
                      duration: 0.2,
                      ease: "easeIn",
                    },
                  },
                },
              }}
            >
              <ModalContent>
                {(onModalClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      🎉 HeroUI 모달 테스트
                    </ModalHeader>
                    <ModalBody>
                      <p>이 모달이 정상적으로 열리고 유지되는지 확인해보세요!</p>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          ✅ 모달이 즉시 닫히지 않고 안정적으로 표시됩니다.
                        </p>
                      </div>
                    </ModalBody>
                    <ModalFooter>
                      <Button 
                        color="danger" 
                        variant="light" 
                        onPress={() => {
                          onModalClose();
                          onClose();
                        }}
                      >
                        취소
                      </Button>
                      <Button 
                        color="primary" 
                        onPress={() => {
                          onModalClose();
                          onClose();
                        }}
                      >
                        확인
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-start gap-1">
            <h2 className="text-lg font-semibold">Avatar / Badge / Alert</h2>
            <p className="text-small text-default-500">프로필, 배지, 알럿</p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4 items-start">
            <div className="flex items-center gap-6">
              <Avatar name="홍길동" />
              <Badge color="success" content={"NEW"}>
                <Avatar name="Badge" />
              </Badge>
            </div>
            <Alert
              color="success"
              title="성공"
              description="HeroUI가 정상적으로 동작합니다."
            />
          </CardBody>
          <CardFooter>
            <span className="text-tiny text-default-500">
              컴포넌트 렌더링을 눈으로 확인해 주세요.
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
